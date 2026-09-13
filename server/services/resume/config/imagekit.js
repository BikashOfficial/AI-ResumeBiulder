import ImageKit from "@imagekit/nodejs";

const imageKit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_duT6FpMqLM6S46W6Ed/b6L0ytL8=", // This is the default and can be omitted
});



export default imageKit;
