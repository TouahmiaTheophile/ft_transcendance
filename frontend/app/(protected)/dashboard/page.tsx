import React from 'react'
import GameMenuCard from './components/GameMenuCard'

const page = () => {
  return (
    <main className="flex flex-col items-center justify-start pt-10 px-4 md:px-0">
      <h1
        className="title title-log"
        style={{ fontSize: 'clamp(4rem, 7vw, 7rem)' }}
      >
        GRID
        <span className="underscore">_</span>
        RUNNERS
      </h1>
      <GameMenuCard/>
    </main>
  )
}

export default page