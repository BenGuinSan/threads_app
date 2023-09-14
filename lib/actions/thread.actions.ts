"use server"

import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { revalidatePath } from "next/cache"

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string
}

// Tạo thread
export async function createThread({
    text,
    author,
    communityId,
    path,
}: Params) {

    try {
        connectToDB();

        const createdThread = await Thread.create({
            text,
            author,
            community: null, 
        })
    
        // Không chỉ là tạo thread mà còn gán cái thread đó vào thằng user tạo ra nó
        await User.findByIdAndUpdate(author,{
            $push: {threads: createdThread._id}
        })

        revalidatePath(path)
    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)
    }
    
}

// Fetch toàn bộ Threads từ DB để hiển thị lên web
export async function fetchPosts(pageNumber = 1, pageSize = 10 ){ // Có 1 trang và sẽ hiển thị 10 threads
    try {
        connectToDB();

        // Calculate the number of posts to skip
        const skipAmount = (pageNumber - 1) * pageSize 

        // Tìm những thread mà có giá trị parentId: null, undifined (Những thread có parentId là những cmt và mình chỉ tìm những thread là các bài viết gốc)
        const postsQuery = Thread.find({parentId: {$in:[null, undefined]}})
        .sort({createdAt: "desc"}) // Sắp xếp theo thời gian tăng dần => bài viết nào mới tạo sẽ được hiển thị lên đầu
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
            path: 'author', 
            model: User
        })
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: "_id name parentId image"
            }
        })

        // Tổng số lượng các thread trên DB
        const totalPostsCount = await Thread.countDocuments({parentId:  {$in: [null, undefined]}})

        // Các thread được lấy xuống thông qua các điều kiện thiết lập trong postsQuery được lưu vào biến posts (thread ở trang hiện tại)
        const posts = await postsQuery.exec()

        // Kiểm tra xem có trang tiếp theo hay không bằng cách xem rằng tổng số thread trên DB có lớn hơn số lương thread tại trang hiện tại
        // Với số lượng thread được skip hay không
        const isNext = totalPostsCount > skipAmount + posts.length

        // Trả về các thread được lấy xuống và isNext
        return {posts, isNext}

    } catch (error: any) {
        throw new Error(`Failed to fetch posts: ${error.message}`)       
    }
}

// Fetch thread trùng với id được truyền vào
export async function fetchThreadById(id: string) {
    connectToDB();

    try {

        // TODO: Populate Community

        // Tạo câu truy vấn với những điều kiện kèm theo, xây dựng cấu trúc cho việc comment
        const thread = await Thread.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: "_id id name image"
        })
        .populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: '_id id name parentId image'
                },
                {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: '_id id name parentId image'
                    }
                }
            ]
        }).exec()

        return thread
    } catch (error: any) {
        throw new Error(`Failed to fetch Thread: ${error.message}`)
    }
}

export async function addCommentToThread(threadId: string, commentText: string, userId: string, path: string ) {
    connectToDB();
    
    try {
        // Find the original Thread by Id
        const originalThread = await Thread.findById(threadId);
        
        if(!originalThread) {
            throw new Error('Thread not found')
        }

        // Create a new Thread with the comment Text
        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId
        })

        // Save the new thread
        const savedCommentThread = await commentThread.save()

        // Update the original thread to include the new comment
        originalThread.children.push(savedCommentThread._id)

        // Save the original thread
        await originalThread.save()

        revalidatePath(path)
    } catch (error: any) {
        throw new Error(`Error adding comment to Thread: ${error.message} `)
    }
}

export async function fetchUserPosts(userId: string) {
    connectToDB()

    try {

        // Find all threads authored by user with the given userId
        const threads = await User.findOne({id: userId})
        .populate({ 
            path: 'threads',
            model: Thread,
            populate: { 
                path: 'children',
                model: Thread,
                populate: { 
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            }
        })
        
        return threads
    } catch (error: any) {
       throw new Error(`Failed to fetch Posts: ${error.message}`) 
    }
}