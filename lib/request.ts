import 'server-only';
export async function boundedText(request:Request,limit:number){
 if(Number(request.headers.get('content-length')||0)>limit)throw Error('TOO_LARGE');
 const reader=request.body?.getReader();if(!reader)return '';
 const chunks:Uint8Array[]=[];let total=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit){await reader.cancel();throw Error('TOO_LARGE');}chunks.push(value);}}finally{reader.releaseLock();}
 return Buffer.concat(chunks).toString('utf8');
}
