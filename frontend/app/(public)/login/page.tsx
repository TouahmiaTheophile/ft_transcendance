import LoginCard from "./components/LoginCard";

const page = () => {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen pt-10 px-4 md:px-0">
      <h1 className="title title-log">
        LOGIN
      </h1>
      <LoginCard/>
    </main>
  )
}

export default page