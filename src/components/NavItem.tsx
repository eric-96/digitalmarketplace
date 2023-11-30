'use client'
import { PRODUCT_CATEGRORIES } from "@/config"
import { Button } from "./ui/button"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

type Category = typeof PRODUCT_CATEGRORIES[number]

interface NavItemProps {
    category: Category
    handleOpen: () => void
    isOpen: boolean
    isAnyOpen: boolean
}

const NavItem = ({isAnyOpen, category, handleOpen, isOpen}: NavItemProps) => {
  return (
    <div className="flex">
        <div className="relative flex items-center">
            <Button className="gap-1.5"
             onClick={handleOpen} 
             variant={isOpen ? 'secondary' : 'ghost'}>
                {category.label}
                <ChevronDownIcon className={cn('w-4 h-4 transition-all text-muted-foreground',
                 isOpen && 'transform rotate-180')} />
            </Button>
        </div>
        
        {isOpen ? (
            <div className={cn('absolute inset-0 top-full text-muted-foreground text-sm',
            {
            'animate-in fade-in-10 slide-in-from-top-5': !isAnyOpen,
            }
            )}>
                <div className="absolute inset-0 top-1/2 bg-white shadow"
                 aria-hidden='true'/>

                 <div className="relative bg-white">
                    <div className="mx-auto max-w-7xl px-8">
                        <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                            <div className="col-span-4 col-start-1 grid grid-cols-3 gap-x-8">
                                {category.featured.map((item) => (
                                    <div
                                    key={item.name}
                                    className="group relative text-base sm:text-sm"
                                    >
                                        <div className="relative aspect-video overflow-hidden
                                         rounded-lg bg-gray-100 group-hover:opacity-75">
                                            <Image 
                                            src={item.imageSrc}
                                            alt="product category image" 
                                            fill
                                            className="object-cover object-center"/>

                                         </div>

                                         <Link 
                                            href={item.href}
                                            className="mt-6 block font-medium text-gray-900">
                                              {item.name}
                                        </Link>
                                        <p 
                                        className="mt-1"
                                        aria-hidden="true">
                                        Shop Now
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        ) : null}
    </div>
  )
}

export default NavItem