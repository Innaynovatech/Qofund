import { useState, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import Header from "./layoutComponents/Header";
import Footer from "./layoutComponents/Footer";
import { Sidebar } from "./layoutComponents/Sidebar";
import { UserData } from "../dummy/UserData";


export default function Layout(props: { children: ReactNode }) {
  const [showNav, setShowNav] = useState(false);
  const [collapse, setCollapse] = useState(false);;

  return (
    <div className="h-screen overflow-hidden">
      <section className={twMerge("w-full flex h-screen")}>
        {!collapse && showNav && (
          <div
            className="h-screen w-screen bg-black/10 fixed lg:hidden z-20"
            onClick={() => {
              setShowNav(!showNav);
              setCollapse(!collapse);
            }}
          ></div>
        )}
        <Sidebar collapsed={collapse} onCollapsedChange={setCollapse} />
        <div
          className={twMerge(
            "duration-200",
            collapse ? " w-[calc(100vw-72px)]" : "w-[calc(100vw-72px)]", 
          )}
        >
          <Header user={UserData} />
          {/* <AieUpdateBanner /> */}
          <main className="h-[calc(100vh-4vh)] px-2 md:px-4 lg:px-5 w-full overflow-y-auto pb-[2vh] pt-4">
            {props.children}
          </main>

          <Footer />
        </div>
      </section>
    </div>
  );
}
