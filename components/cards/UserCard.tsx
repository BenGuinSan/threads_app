"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

interface Props {
    id: string,
    username: string,
    name: string,
    imgUrl: string,
    personType: string,
}

const UserCard = ({id, username, name, imgUrl, personType}: Props) => {
    const router = useRouter()
  
    return (
    <article className="user-card">
        <div className="user-card_avatar">
            <Link href={`/profile/${id}`}>
                <Image
                    src={imgUrl}
                    alt="User Photo"
                    height={48}
                    width={48}
                    className="rounded-full"
                />
            </Link>
            
            <div className="flex-1 text-ellipsis">
                <h3 className="text-base-semibold text-light-1">
                    {name}
                </h3>
                <p className="text-small-medium text-gray-1">
                    @{username}
                </p>
            </div>

            <Button className="user-card_btn" onClick={() => router.push(`/profile/${id}`)}>
                View 
            </Button>
        </div>
    </article>
  )
}

export default UserCard