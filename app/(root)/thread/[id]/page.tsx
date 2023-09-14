import ThreadCard from "@/components/cards/ThreadCard"
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import Comment from "@/components/forms/Comment";

// tham số param là 1 tham số kiểu đối tượng param và có thuộc tính ID là string
// Điều này để đảm bảo rằng thuộc tính ID luôn là chuổi
const Page = async ({params}: {params: {id: string}}) => {
    const user = await currentUser()
    if(!user) return null;

    if(!params.id) return null;
    
    const userInfo = await fetchUser(user.id)
    if(!userInfo?.onboarded) redirect('/onboarding')

    const thread = await fetchThreadById(params.id)

    // Thread details
    return(

        <section className="relative">
            {/* Thread card details */}
            <div>
                <ThreadCard 
                    key={thread._id}
                    id={thread._id}
                    currentUserId={user?.id}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            </div>
            {/* Thread card reply */}
            <div className="mt-7">
                <Comment 
                    threadId={thread._id} // Cần truyền vào thread Id để biết được comment đó thuộc thread nào
                    currentUserImage={userInfo.image} // cần truyền vào current user image để lấy được avatar người comment ví dụ khi mình muốn cmt 1 bài biết thì avt của mình sẽ hiển thị trên thanh cmt
                    currentUserId={JSON.stringify(userInfo._id)} // Cần phải biết được id người dùng của người cmt. Và vì (_id) có thể là 1 kiểu dữ liệu obj đặc biệt nào đó của MB nên mình phải truyển nó thành string
                />
            </div>
            <div className="mt-10">
                {thread.children.map((childItems: any) => (
                    <ThreadCard 
                        key={childItems._id}
                        id={childItems._id}
                        currentUserId={childItems?.id}
                        parentId={childItems.parentId}
                        content={childItems.text}
                        author={childItems.author}
                        community={childItems.community}
                        createdAt={childItems.createdAt}
                        comments={childItems.children}
                        isComment
                    />
                ))}
            </div>
        </section>
    )
}

export default Page