import sharp from 'sharp';
export async function cleanPhoto(input:Buffer){
 if(input.byteLength>3*1024*1024||!input.byteLength)throw Error('SIZE');
 const info=await sharp(input,{limitInputPixels:25_000_000,animated:false}).metadata();
 if(!['jpeg','png','webp'].includes(info.format||''))throw Error('FORMAT');
 return sharp(input,{limitInputPixels:25_000_000}).rotate().resize(1600,1600,{fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer();
}
