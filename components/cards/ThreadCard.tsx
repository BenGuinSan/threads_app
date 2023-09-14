import Link from "next/link"
import Image from "next/image"

interface Props {
    id: string,
    currentUserId: string | undefined,
    parentId: string | null,
    content: string,
    author: {
        id: string
        name: string,
        image: string,
    },
    community: {
        id:string
        name: string,
        image: string,
    } | null,
    createdAt: string,
    comments: {
        author: {
            image: string, // Đây là threadcard chứ không phải là threadCard chi tiết nên chỉ cần hiển thị ảnh người cmt chứ k cần hiển thị người đó cmt cụ thể là gì
        }
    }[],
    isComment?: boolean, 
}

const ThreadCard = (
    {
        id,
        currentUserId,
        parentId,
        content,
        author,
        community,
        createdAt,
        comments,
        isComment,
    }: Props) => {
  return (
    <article className={`flex w-full flex-col rounded-xl ${isComment ? 'px-0 xs:px-7': 'bg-dark-3 p-7'}`}>
        {/* Author */}
        <div className="flex items-start justify-between">
            <div className="flex w-full flex-1 flex-row gap-4">
                {/* Avatar of Author */}
                <div className="flex flex-col items-center">
                    <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
                        <Image
                            src={author.image}
                            alt="Profile Image"
                            fill
                            className="cursor-pointer rounded-full"
                        />
                    </Link>
                    <div className="thread-card_bar "/>
                </div>

                {/* Name of Author */}
                <div className="flex w-full flex-col">
                    <Link href={`/profile/${author.id}`} className="w-fit">
                        <h4 className="cursor-pointer text-base-semibold text-light-1">
                            {author.name}  
                        </h4>
                    </Link>
                    
                    {/* Content Of Thread */}
                    <p className={`${isComment && 'mb-10'}mt-2 text-small-regular text-light-2`}>{content}</p>

                    <div className="mt-5 flex flex-col gap-3">
                        {/* Activities of Thread */}
                        <div className="flex gap-3.5">
                            <Image src="/assets/heart-gray.svg" alt="heart" height={24} width={24} className="cursor-pointer object-contain"/>
                            <Link href={`/thread/${id}`}>
                                <Image src="/assets/reply.svg" alt="reply" height={24} width={24} className="cursor-pointer object-contain"/>
                            </Link>
                            <Image src="/assets/repost.svg" alt="repost" height={24} width={24} className="cursor-pointer object-contain"/>
                            <Image src="/assets/share.svg" alt="share" height={24} width={24} className="cursor-pointer object-contain"/>
                        </div>

                        {/* Comment of Thread */}
                        <div>
                            {isComment && comments.length > 0 && (
                                <Link href={`/thread/${id}`}>
                                    <p className="mt-1 text-subtle-medium text-gray-1">
                                        {comments.length} replies
                                    </p>
                                </Link>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </article>
  )
}

export default ThreadCard