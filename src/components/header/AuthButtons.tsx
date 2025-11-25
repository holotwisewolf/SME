import { useLogin } from "../../components/login/LoginProvider";

const AuthButtons = () => {
  const { openLogin } = useLogin();

  return (
    <div className="flex space-x-4">
      <button
        onClick={openLogin}
        className="bg-transparent text-[#D1D1D1] border border-[#888] rounded-md px-8 py-2.5 hover:bg-[#D1D1D1]/20 transition"
      >
        Log In
      </button>

      <button className="bg-[#bfbfbf] text-black font-bold rounded-md px-8 py-2.5 hover:bg-[#ededed] transition">
        Sign Up
      </button>
    </div>
  );
};

export default AuthButtons;
