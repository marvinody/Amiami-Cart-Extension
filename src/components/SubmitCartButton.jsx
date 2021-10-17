import PropTypes from 'prop-types';
import { useState } from 'react';

export default function SubmitCartButton({
  noItems,
  activeTab,
  onClick,
}) {

  const [wasClicked, setClicked] = useState(false);


  const btnClasses = [
    "inline-flex", "items-center", "px-3", "py-2", "border", "border-transparent",
    "text-sm", "leading-4", "font-medium", "rounded-md", "shadow-sm", "text-white",
    "bg-indigo-600", "hover:bg-indigo-700", "focus:outline-none", "focus:ring-2",
    "focus:ring-offset-2", "focus:ring-indigo-500"
  ];

  if (noItems || !activeTab) {
    btnClasses.push('opacity-50', 'cursor-not-allowed');
  }

  return <div className='mt-4 flex'>
    <button
      onClick={() => {
        setClicked();
        onClick();
      }}
      disabled={noItems || wasClicked}
      type="button"
      className={btnClasses.join(' ')}
    >
      Add to Amiami Cart
    </button>
  </div>;

}



SubmitCartButton.propTypes = {
  noItems: PropTypes.bool,
  activeTab: PropTypes.bool,
  onClick: PropTypes.func,
};
