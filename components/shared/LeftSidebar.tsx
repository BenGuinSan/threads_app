"use client"
import Link from "next/link"
import {sidebarLinks} from "../../constants/index";
import Image from "next/image";
import { SignedIn, SignOutButton, useAuth } from "@clerk/nextjs";
// sử dụng thằng này để xác định mình đang ở pathname nào
import {usePathname, useRouter} from "next/navigation"


const LeftSidebar = () => {
  const router = useRouter()
  const pathname = usePathname()

  const {userId} = useAuth()

  return (
    <section className='custom-scrollbar leftsidebar'>
      <div className='flex w-full flex-1 flex-col gap-6 px-6'>
        {sidebarLinks.map((link) => {
          const isActive = (pathname.includes(link.route) && link.route.length > 1 ) || pathname === link.route

          // Nếu param là '/profile' thì link.route = '/profile/userId'
          if(link.route === "/profile") link.route = `${link.route}/${userId}`

         return(
          <Link href={link.route} key={link.label} className={`leftsidebar_link ${isActive && 'bg-primary-500'}` }>
            <Image
              src={link.imgURL} 
              alt="Link Photo"
              height={24}
              width={24}
            />
            <p className="text-light-1 max-lg:hidden">{link.label}</p>
          </Link>
          )
        })}
      </div>
      <hr className="my-4 border-gray-300 border-b-2" />
      <div className="mt-10 px-6">
          <SignedIn>
            <SignOutButton signOutCallback={() => router.push('/sign-in')}>
              <div className="flex cursor-pointer gap-4 px-4">
                <Image
                  src='/assets/logout.svg'
                  alt='logout'
                  width={24}
                  height={24}
                />
                <p className="text-light-2 max-lg:hidden">Logout</p>
              </div>
            </SignOutButton>
          </SignedIn>
      </div>
    </section>
  )
}

export default LeftSidebar