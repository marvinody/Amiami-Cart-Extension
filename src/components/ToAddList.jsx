import PropTypes from 'prop-types';
import { XCircleIcon } from '@heroicons/react/outline';

const getDisplayName = ({ name, scode }) => {
  if (!name) {
    return `Loading - ${scode}`;
  }

  if (name.length > 32) {
    return `${name.slice(0, 32)}...`;
  }

  return name;
};

const ToAddItem = ({ scode, url, thumb, name, amt }) => {
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
            <a href={url} title={name} className="text-sm font-medium underline">
              {getDisplayName({ name, scode })}
            </a>
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

export default function ToAddList(props) {

  return <div className="flow-root mt-8">
    <ul role="list" >
      {props.items.map(item => <ToAddItem key={item.scode} {...item}></ToAddItem>)}
    </ul>
  </div>;

}

ToAddList.propTypes = {
  items: PropTypes.array,
};

ToAddItem.propTypes = {
  scode: PropTypes.string,
  url: PropTypes.string,
  thumb: PropTypes.string,
  name: PropTypes.string,
  amt: PropTypes.number,
};
