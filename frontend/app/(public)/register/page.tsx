import RegisterCard from "./components/RegisterCard";

const page = () => {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen pt-10 px-4 md:px-0">
      <h1 className="title title-log">
        REGISTER
      </h1>
      <RegisterCard/>
    </main>

  )
}

export default page