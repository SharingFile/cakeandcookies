const Menu = require('../../../models/menu');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function toTitleCase
const toTitleCase = (phrase) => {
    return phrase
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
};

// Declaring Regex
const regexItemName = /^([a-zA-Z0-9' ]+)$/;
const regexItemSize = /^(?=.*[a-z0-9])[a-z0-9@# ₹.,*-]{1,15}$/;

const storage = multer.diskStorage({
    destination: './public/img/items/',
    filename: function(req, file, cb) {
       
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
})

const upload = multer({
    storage,
    limits: {fileSize : 1000000 * 5 }, // 5 MBs
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('itemImage');

// check file type
function checkFileType(file, cb){
    // allowed exts
    const fileTypes = /jpeg|jpg|png|webp/;
    // check ext
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    // mime type
    const mimeType = fileTypes.test(file.mimetype)
    if(mimeType && extName)
        return cb(null, true)
    return cb('Only Images are allowed!');
}

function updateMenu() {
    return {
        async index(req, res) {
            const items = await Menu.find()
            return res.render('admin/update_menu', {items});
        },
        updateMenu(req, res) {
            
            upload(req, res, async(err) => {
                if(err) {
                    req.flash('error', err);
                    return res.redirect('/admin/update_menu');
                }

                // Declairing variables
                const itemName = await toTitleCase((req.body.itemName).trim());
                const itemPrice = await (req.body.itemPrice).trim();
                const itemSize = await toTitleCase((req.body.itemSize).trim());
                // console.log(req.file.path)

                if(itemName.length < 1){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', 'Please enter Item name!')
                    return res.redirect('/admin/update_menu')
                }
                if(!regexItemName.test(itemName)){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', 'Item name can have alphabets and numbers only!')
                    return res.redirect('/admin/update_menu')
                }
                if(itemName.length < 3 || itemName.length > 30){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);    
                    req.flash('error', `Item name must be grater than 2 characters 
                                        and lesser than 30 characters!`)
                    return res.redirect('/admin/update_menu')
                }

                if(itemSize.length < 1){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', 'Please enter Item small description!')
                    return res.redirect('/admin/update_menu')
                }
                if(regexItemSize.test(itemSize)){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', `Item small description can only have alphabets, numbers
                                        and special characters (@# ₹.,*-)!`)
                    return res.redirect('/admin/update_menu')
                }
                if(itemSize.length < 1 || itemSize.length > 15){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', `Item small description must have atleast 1 character and
                                        can have upto 15 characters!`)
                    return res.redirect('/admin/update_menu')
                }

                if(itemPrice.length < 1){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', 'Please enter Item price!')
                    return res.redirect('/admin/update_menu')
                }
                if(isNaN(itemPrice)){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', `Item price can only be a number!`)
                    return res.redirect('/admin/update_menu')
                }
                if(itemPrice < 1){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', `Item price can't be less than ₹ 1!`)
                    return res.redirect('/admin/update_menu')
                }

                const item = await Menu.findById(req.body.itemId);
                if(item) {
                    if(req.file){
                        console.log(req.file.filename)
                        const path = './public/img/'+item.image;
                        fs.unlink(path, (err) => {});
                        item.image = 'items/'+req.file.filename;
                    }
                    item.name = itemName;
                    item.price = itemPrice;
                    item.size = itemSize;
                    item.save();
                    res.redirect('/admin/update_menu');
                }else {
                    req.flash('error', 'Something is not right, Please try again!');
                    res.redirect('/admin/update_menu');
                }
            })
        },
        async lockMenu(req, res) {
            const item = await Menu.findById(req.body.itemId)
            if(item) {
                item.available = false;
                item.save();
                res.redirect('/admin/update_menu');
            }else{
                req.flash('error', 'Something is not right, Please try again!');
                res.redirect('/admin/update_menu');
            }         
        },
        async unlockMenu(req, res) {
            const item = await Menu.findById(req.body.itemId)
            if(item) {
                item.available = true;
                item.save();
                req.flash('success', `Item successfully updated.`)
                res.redirect('/admin/update_menu');
            }else{
                req.flash('error', 'Something is not right, Please try again!');
                res.redirect('/admin/update_menu');
            }   
        },
        async deleteMenu(req, res) {
            const item = await Menu.findById(req.body.itemId)
            const path = './public/img/'+item.image;
            fs.unlink(path, (err) => {});
            item.deleteOne({ _id: req.body.itemId });
            res.redirect('/admin/update_menu');
        },
        addMenu(req, res) {

            upload(req, res, async(err) => {
                if(err) {
                    req.flash('error', err);
                    return res.redirect('/admin/update_menu');
                }

                // Declairing variables
                const itemName = await toTitleCase((req.body.itemName).trim());
                const itemPrice = await (req.body.itemPrice).trim();
                const itemSize = await toTitleCase((req.body.itemSize).trim());

                if(itemName.length < 1){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', 'Please enter Item name!')
                    req.flash('itemName', itemName)
                    req.flash('itemSize', itemSize)
                    req.flash('itemPrice', itemPrice)
                    return res.redirect('/admin/update_menu')
                }
                if(!regexItemName.test(itemName)){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', 'Item name can have alphabets and numbers only!')
                    req.flash('itemName', itemName)
                    req.flash('itemSize', itemSize)
                    req.flash('itemPrice', itemPrice)
                    return res.redirect('/admin/update_menu')
                }
                if(itemName.length < 3 || itemName.length > 30){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);    
                    req.flash('error', `Item name must be grater than 2 characters 
                                        and lesser than 30 characters!`)
                    req.flash('itemName', itemName)
                    req.flash('itemSize', itemSize)
                    req.flash('itemPrice', itemPrice)
                    return res.redirect('/admin/update_menu')
                }

                if(itemSize.length < 1){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', 'Please enter Item small description!')
                    req.flash('itemName', itemName)
                    req.flash('itemSize', itemSize)
                    req.flash('itemPrice', itemPrice)
                    return res.redirect('/admin/update_menu')
                    
                }
                if(regexItemSize.test(itemSize)){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', `Item small description can only have alphabets, numbers
                                        and special characters (@# ₹.,*-)!`)
                    req.flash('itemName', itemName)
                    req.flash('itemSize', itemSize)
                    req.flash('itemPrice', itemPrice)
                    return res.redirect('/admin/update_menu')
                }
                if(itemSize.length < 1 || itemSize.length > 15){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', `Item small description must have atleast 1 character and
                                        can have upto 15 characters!`)
                    req.flash('itemName', itemName)
                    req.flash('itemSize', itemSize)
                    req.flash('itemPrice', itemPrice)
                    return res.redirect('/admin/update_menu')
                }

                if(itemPrice.length < 1){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', 'Please enter Item price!')
                    req.flash('itemName', itemName)
                    req.flash('itemSize', itemSize)
                    req.flash('itemPrice', itemPrice)
                    return res.redirect('/admin/update_menu')
                }
                if(isNaN(itemPrice)){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', `Item price can only be a number!`)
                    req.flash('itemName', itemName)
                    req.flash('itemSize', itemSize)
                    req.flash('itemPrice', itemPrice)
                    return res.redirect('/admin/update_menu')
                }
                if(itemPrice < 1){
                    if(req.file)
                    await fs.unlinkSync(req.file.path);
                    req.flash('error', `Item price can't be less than ₹ 1!`)
                    req.flash('itemName', itemName)
                    req.flash('itemSize', itemSize)
                    req.flash('itemPrice', itemPrice)
                    return res.redirect('/admin/update_menu')
                }
                
                // Create Menu
                const menu = new Menu;

                if(req.file){
                    console.log(req.file.filename)
                    menu.image = 'items/'+req.file.filename;
                }
                menu.name = itemName;
                menu.price = itemPrice;
                menu.size = itemSize;
                menu.available = true;

            menu.save().then(() => {
                req.flash('success', `Item successfully added.`)
                return res.redirect('/admin/update_menu')
            }).catch(err => {
                req.flash('error', 'Something went wrong!')
                return res.redirect('/admin/update_menu')
            })

            })
        }
    } 
}

module.exports = updateMenu;