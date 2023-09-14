import mongoose from "mongoose";

const userSchema =  new mongoose.Schema({
    id: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: String,
    bio: String,
    // Một người dùng có thể tạo bao nhiêu threads
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ],
    onboarded: {
        type: Boolean,
        default: false
    },
    // Một user có thể thuộc nhiều community
    communities: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    }
})

// Lần đầu tiên khởi chạy model User thì (mongoose.models.User) vẫn chưa tồn tại thì nó
// sẽ rơi vào (mongoose.model('User', userSchema)) khởi tạo 1 model tên là User dựa vào base là userSchema
// Thế nên từ lần thứ 2 load model thì sẽ không phải khởi tạo nữa
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;