/* eslint-disable react/prop-types */
import { useState } from 'react';
import { XCircleIcon } from '@heroicons/react/outline';


const ToAddItem = ({ url, thumb, name, amt }) => {
  return <li>
    <div className="relative pb-8">
      <div className="relative flex space-x-3">
        <div>
          <img className='w-8 rounded-full bg-gray-400 flex items-center
        justify-center ring-8 ring-white' src={thumb} />
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
          <div>
            <span className='mr-2'>({amt})</span>
            <a href={url} className="text-sm font-medium underline">{name}</a>
          </div>
        </div>
        <div className='inline-flex items-center p-2'>
          <button
            type="button"
            className=" border border-transparent rounded-full shadow-sm
          text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2
          focus:ring-offset-2 focus:ring-indigo-500"
          >
            <XCircleIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </li>;
};

export default function ToAddList() {

  const [items] = useState([
    {
      url: "https://www.amiami.com/eng/detail/?gcode=GOODS-04152310",
      amt: 1,
      thumb: "https://img.amiami.com/images/product/main/213/GOODS-04152310.jpg",
      name: "[Bonus] Touhou Plush Series 17 Kaguya Houraisan Fumofumo Kaguya.(Pre-order)",
    },
    {
      url: "https://www.amiami.com/eng/detail/?gcode=GOODS-04152311",
      amt: 2,
      thumb: "https://img.amiami.com/images/product/main/213/GOODS-04152311.jpg",
      name: "[Bonus] Touhou Plush Series 18 Fujiwara no Mokou Fumofumo Moko.(Pre-order)",
    },
    {
      url: "https://www.amiami.com/eng/detail/?gcode=CGD-9540",
      amt: 3,
      thumb: "https://img.amiami.com/images/product/review/102/CGD-9540_01.jpg",
      name: "Touhou Plushie Series EX3 Cirno Deka Fumo Cirno (Single Shipment)",
    },
  ]);

  return <div className="flow-root mt-8">
    <ul role="list" >
      {items.map(item => <ToAddItem key={item.url} {...item}></ToAddItem>)}
    </ul>
  </div>;

}
