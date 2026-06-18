import IdentificationCard from "./components/IdentificationCard";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen pt-20 px-4 md:px-0">
      <p className="subtitle-top">Welcome to</p>
      <h1 className="title">
        GRID
        <span className="underscore">_</span>
        RUNNERS
      </h1>
      <div className="thin-line" aria-hidden="true" />
      <div className="mt-12">
        <IdentificationCard/>
      </div>
    </main>
  );
}
