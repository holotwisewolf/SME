import React from "react";

const InputGroup = ({ children }: { children: React.ReactNode }) => {
    return <div className="flex flex-col gap-5 w-full">{children}</div>;
};

export default InputGroup;
