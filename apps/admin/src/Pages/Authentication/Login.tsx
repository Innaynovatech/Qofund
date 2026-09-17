
import { useState } from "react";

const Login = () => {

  
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col justify-center w-full overflow-hidden bg-white md:flex-row md:w-1/2 ">
        <div className="absolute top-4 left-4 flex items-center justify-between w-full pr-4 md:pr-8">
          <img
            src="/assets/logo-clear.png"
            alt="Logo"
            className="h-auto w-48"
          />
        </div>

        <div className=" relative flex items-center justify-center w-full max-w-md md:px-8 -mt-12 space-y-1 md:mt-8">
          <div className="w-full max-w-md px-8 -mt-6 space-y-1">
            <div className="pb-4 space-y-2 text-center md:text-left">
              <h2 className="text-xl font-bold">Portal Login</h2>
              <p className="text-sm">Hi, Welcome back</p>
            </div>

          <div>form here</div>

            {/* Additional Links and Info */}
            <div className="pt-2 space-y-4 text-sm">
              <p className="text-center">
                Not registered yet?
                <a href="register" className="text-[#007D53] hover:text-[#007D53] ml-2 font-semibold">
                  Register Now
                </a>
              </p>


          <div>footer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Section - Hidden on small screens */}
      <div className="hidden md:block md:w-1/2">
        <img
          src="/assets/bkgrdPix.png"
          alt="Login Visual"
          className="object-cover object-top w-full h-full"
        />
      </div>
    </div>
  );
};

export default Login;
