
const multer = require('multer');
const path = require("path")

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}
const storage = multer.diskStorage({
  destination: (req,file,cb)=>{
      cb(null,"./public/productImages")
  },
  filename: (req,file,cb)=>{
      console.log(file);
      cb(null, Date.now() + path.extname(file.originalname) )
  }
})
const upload =multer({storage:storage})


module.exports = upload
