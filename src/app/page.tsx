import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import React from 'react'

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Card className='w-[500px] h-[350px] flex justify-center items-center'>
        <Link href={"/quiz"}>
          <Button>
            Start quiz
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default Home