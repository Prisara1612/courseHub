
import React from "react";
import { Link } from "react-router-dom";

const Button = ({ children, active, linkto, type = "button" }) => {
  return linkto ? (
    <Link to={linkto}>
      <button
        type={type}
        className={`text-center text-[13px] sm:text-[16px] px-6 py-3 rounded-md font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] ${
          active ? "bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-black" : "bg-richblack-800"
        } hover:shadow-none hover:scale-95 transition-all duration-200`}
      >
        {children}
      </button>
    </Link>
  ) : (
    <button
      type={type}
      className={`text-center text-[13px] sm:text-[16px] px-6 py-3 rounded-md font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] ${
        active ? "bg-gradient-to-b from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-black" : "bg-richblack-800"
      } hover:shadow-none hover:scale-95 transition-all duration-200`}
    >
      {children}
    </button>
  );
};

export default Button;
