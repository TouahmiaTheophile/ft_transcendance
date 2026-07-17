import Link from "next/link";
import RegisterCard from "./components/RegisterCard";

const page = () => {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen pt-10 px-4">
      <Link
          href="/"
          aria-label="Back to home page"
          className="self-start flex items-center gap-2 text-sm text-white/60 hover:text-white w-fit"
        >
          <span className="text-lg leading-none">←</span>
          Home
        </Link>
      <h1 className="title title-log">
        REGISTER
      </h1>
      <RegisterCard/>
    </main>

  )
}

export default page