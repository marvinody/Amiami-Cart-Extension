import { PlusCircleIcon } from '@heroicons/react/outline';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ITEM_LOOKUP } from '../MessageTypes';


const CODE_REGEX = /((\w+-)+(\d+))/;
const validateCodeInput = (code) => {
  const matches = code.match(CODE_REGEX);
  if (!matches) {
    return [false];
  }
  return [true, matches[0]];
};

export default function ToAddInput(props) {

  const [code, setCode] = useState("");
  const [amt, setAmt] = useState(1);
  const [btnDisabled, setBtnDisabled] = useState(true);

  const onCodeChange = (evt) => {
    const newCode = evt.target.value;
    const [ableToPull, pulledCode] = validateCodeInput(newCode);

    setBtnDisabled(!ableToPull || !props.activeTab);
    setCode(pulledCode);
  };

  const onAmtChange = (evt,) => {
    setAmt(evt.target.value);
  };

  const onSubmit = (evt) => {
    console.log("SUBMISSION");
    evt.preventDefault();
    console.log({
      code, amt
    });

    props.addPendingItem({
      scode: code,
      amt,
    });

    props.sendMessage({
      [ITEM_LOOKUP]: code,
    });
    setCode("");
    setBtnDisabled(true);
  };

  const btnClasses = [
    "-ml-px", "relative", "inline-flex", "items-center", "space-x-2", "px-4", "py-2", "border",
    "border-gray-300", "text-sm", "font-medium", "rounded-r-md", "text-gray-700", "bg-gray-50",
    "hover:bg-gray-100", "focus:outline-none", "focus:ring-1", "focus:ring-indigo-500",
    "focus:border-indigo-500"
  ];
  if (btnDisabled) {
    btnClasses.push('opacity-25', 'cursor-not-allowed');
  }

  return <form onSubmit={onSubmit}>
    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
      Amiami Code (or URL)</label>
    <div className="mt-1 flex rounded-md shadow-sm">
      <div className="relative flex items-stretch flex-grow focus-within:z-10">
        <input type="text" name="code" id="code" className="focus:ring-indigo-500
    focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
          placeholder="CGD-9540"
          value={code}
          onChange={onCodeChange}
          required={true}
        />
      </div>
      <div className="inset-y-0 right-0 relative inline-flex items-center">
        <select id="amt" name="amt" className="focus:ring-indigo-500
      focus:border-indigo-500 border-gray-300 h-full py-0 pl-2 pr-7
      text-gray-500 sm:text-sm focus-within:z-10"
          value={amt}
          onChange={onAmtChange}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>
      <button type="submit" disabled={btnDisabled}
        className={btnClasses.join(' ')}>
        <PlusCircleIcon className="h-6 w-6" />
      </button>
    </div>
  </form>;
}

ToAddInput.propTypes = {
  sendMessage: PropTypes.func,
  addPendingItem: PropTypes.func,
  activeTab: PropTypes.bool,
};
