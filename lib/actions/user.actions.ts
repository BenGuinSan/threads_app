"use server"

import { FilterQuery, SortOrder } from "mongoose"
import User from "../models/user.model"
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache"
import Thread from "../models/thread.model"

interface Params {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string
}

// Cập nhật thông tin người dùng trong DB mongoose
export async function updateUser({
        userId,
        username,
        name,
        bio,
        image,
        path
    }: Params): Promise<void> {

    try {
        // Kết nối với DB mongoose
        connectToDB()
        // Tìm kiếm và cập nhất người dùng thông qua userId và người dùng có các trường là
        // username, name, bio, image, onboarded
        // Upsert: true ở đây để chỉ định rằng nếu không có người dùng nào có userId phù hợp trong DB thì sẽ tạo 1 người dùng mới
        await User.findOneAndUpdate(
            {id: userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true
            },
            {
                upsert: true,
            }
        );

        // Reset cache ngay khi vừa cập nhật thông tin trong /profile/edit để thông tin luôn được làm mới         
        if(path === "/profile/edit") {
            revalidatePath(path);        
        }

    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User.findOne({id: userId})
        // .populate({
        //     path: 'communities',
        //     model: Community
        // })
    } catch (error: any) {
        throw new Error(`Failed to fetch User: ${error.message}`);
    }
}

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
} : {
    userId: string,
    searchString?: string,
    pageNumber?: number,
    pageSize?: number,
    sortBy?: SortOrder
}) {
    
    try {
        connectToDB()
        
        const skipAmount = (pageNumber - 1) * pageSize

        // Cấu hình cho việc search text đều thỏa với trường hợp chữ hoa hay thường
        const regex = new RegExp(searchString, 'i')

        // Tạo câu truy vấn để fetch user và sắp xếp nó
        const query: FilterQuery<typeof User> = {
            id: {$ne: userId} // Tìm những user có id không phải là current User
        }

        // Kiểm tra searchString có giá trị hay không nếu có thì thực hiện truy vấn theo username or name và cả 2 đều được quy ước không phân biệt hoa thường
        if(searchString.trim() !== "") {
            query.$or = [
                {username: {$regex: regex}},
                {name: {$regex: regex}}
            ]
        }

        // Sort Option
        const sortOptions = {createAt: sortBy}

        const userQuery = User.find(query)
        .sort(sortOptions) // sắp xếp theo thời gian tạo account
        .skip(skipAmount) 
        .limit(pageSize)

        const totalUsersCount = await User.countDocuments(query) 
        
        // Thực thi câu truy vấn cuối cùng trả về danh sách người dùng
        const users = await userQuery.exec()

        // Kiểm tra còn người dùng để hiển thị không
        const isNext = totalUsersCount > skipAmount + users.length;

        return {users, isNext}

    } catch (error: any) {
        throw new Error(`Failed to fetch Users: ${error.message}`);
    }
}

export async function getActivity(userId: string) {
    try {
        connectToDB();

        // find all threads created by the user
        const userThreads = await Thread.find({author: userId})

        // Collect all the children thread ids (replies) from the 'children' field
        // Lập qua mảng userthreads trả về 1 mảng gồm các userthreads con
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        },[])

        const replies = await Thread.find({
            _id: {$in: childThreadIds}, 
            author: {$ne: userId }
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })

        return replies

    } catch (error: any) {
        throw new Error(`Failed to get Activity: ${error.message}`)
    }
}