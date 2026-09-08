"""Dependency-free PNG crop/alpha utilities for deterministic asset builds."""
import binascii, struct, zlib

def decode_png(data):
    if data[:8] != b'\x89PNG\r\n\x1a\n': raise ValueError('invalid PNG signature')
    pos=8; chunks=[]; width=height=color=None; interlace=None
    while pos < len(data):
        n=struct.unpack('>I',data[pos:pos+4])[0]; kind=data[pos+4:pos+8]; payload=data[pos+8:pos+8+n]; pos+=12+n
        if kind==b'IHDR': width,height,depth,color,_,_,interlace=struct.unpack('>IIBBBBB',payload)
        elif kind==b'IDAT': chunks.append(payload)
        elif kind==b'IEND': break
    if depth!=8 or color not in (2,6) or interlace!=0: raise ValueError(f'unsupported PNG depth/color/interlace: {depth}/{color}/{interlace}')
    channels=3 if color==2 else 4; stride=width*channels; raw=zlib.decompress(b''.join(chunks)); rows=[]; prev=bytearray(stride); offset=0
    def paeth(a,b,c):
        p=a+b-c; pa=abs(p-a); pb=abs(p-b); pc=abs(p-c); return a if pa<=pb and pa<=pc else b if pb<=pc else c
    for _ in range(height):
        f=raw[offset]; offset+=1; scan=bytearray(raw[offset:offset+stride]); offset+=stride
        for x in range(stride):
            a=scan[x-channels] if x>=channels else 0; b=prev[x]; c=prev[x-channels] if x>=channels else 0
            if f==1: scan[x]=(scan[x]+a)&255
            elif f==2: scan[x]=(scan[x]+b)&255
            elif f==3: scan[x]=(scan[x]+((a+b)//2))&255
            elif f==4: scan[x]=(scan[x]+paeth(a,b,c))&255
            elif f!=0: raise ValueError(f'unsupported PNG filter {f}')
        row=bytearray()
        for x in range(width):
            px=scan[x*channels:(x+1)*channels]; row.extend(px if channels==4 else px+b'\xff')
        rows.append(row); prev=scan
    return width,height,rows

def content_bounds(width,height,rows,threshold=12,padding=2):
    minx,widthmax,miny,heightmax=width,-1,height,-1
    for y,row in enumerate(rows):
        for x in range(width):
            i=x*4
            if max(row[i],row[i+1],row[i+2])>threshold and row[i+3]:
                minx=min(minx,x); widthmax=max(widthmax,x); miny=min(miny,y); heightmax=max(heightmax,y)
    if widthmax < 0: raise ValueError('source contains no foreground pixels')
    return [max(0,minx-padding),max(0,miny-padding),min(width,widthmax+padding+1),min(height,heightmax+padding+1)]

def crop_with_black_alpha(rows,box,threshold=12,feather=18):
    from collections import deque
    x0,y0,x1,y1=box; width=x1-x0; height=y1-y0
    dark=[[False]*width for _ in range(height)]
    for y in range(height):
        source=rows[y0+y]
        for x in range(width):
            i=(x0+x)*4; dark[y][x]=max(source[i],source[i+1],source[i+2])<=threshold
    background=[[False]*width for _ in range(height)]; queue=deque()
    for x in range(width):
        if dark[0][x]: queue.append((x,0))
        if dark[height-1][x]: queue.append((x,height-1))
    for y in range(height):
        if dark[y][0]: queue.append((0,y))
        if dark[y][width-1]: queue.append((width-1,y))
    while queue:
        x,y=queue.popleft()
        if background[y][x] or not dark[y][x]: continue
        background[y][x]=True
        for nx,ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if 0<=nx<width and 0<=ny<height and not background[ny][nx]: queue.append((nx,ny))
    out=[]
    for y in range(height):
        row=bytearray(); source=rows[y0+y]
        for x in range(width):
            i=(x0+x)*4; r,g,b,a=source[i:i+4]
            if background[y][x]: alpha=0
            else:
                touches_background=any(0<=nx<width and 0<=ny<height and background[ny][nx] for nx,ny in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)))
                alpha=min(255,round((max(r,g,b)-threshold)*255/max(1,feather))) if touches_background else 255
            row.extend((r,g,b,min(a,max(0,alpha))))
        out.append(row)
    return width,height,out

def encode_rgba(width,height,rows):
    def chunk(kind,payload): return struct.pack('>I',len(payload))+kind+payload+struct.pack('>I',binascii.crc32(kind+payload)&0xffffffff)
    raw=b''.join(b'\x00'+bytes(row) for row in rows)
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',width,height,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,6))+chunk(b'IEND',b'')
