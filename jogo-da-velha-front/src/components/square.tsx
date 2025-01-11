import React from "react";

interface SquareProps {
  className?: string;
  onClick?: () => void;
  value: string;
}

const Square: React.FC<SquareProps> = ({ className, value, onClick }) => {
  return (
    <div className={`innerSquare ${className}`}>
      <input
        type="submit"
        className="button"
        value={value}
        onClick={onClick}
        disabled={value !== ""}
      />
    </div>
  );
};

export default Square;
