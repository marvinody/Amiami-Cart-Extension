import PropTypes from 'prop-types';
import { XCircleIcon } from '@heroicons/react/outline';

import ITEM_META_STATE from '../ItemMetaStates';

const getDisplayName = ({ name, scode }) => {
  if (!name) {
    return `Loading - ${scode}`;
  }

  // if (name.length > 32) {
  //   return `${name.slice(0, 32)}...`;
  // }

  return name;
};

const ToAddItem = ({ scode, url, thumb, name, amt, removeItem, cartItem }) => {

  let ringColor = 'ring-black';
  let ringSize = 'ring-2';
  let titleText = 'Waiting To Add';
  switch(cartItem?.meta?.state) {
  case ITEM_META_STATE.PENDING:
    ringColor = 'ring-gray-500';
    ringSize = 'ring-2';
    titleText = 'Pending (in queue)';
    break;
  case ITEM_META_STATE.IN_PROGRESS:
    ringColor = 'ring-blue-500';
    ringSize = 'ring-4';
    titleText = 'In Progress';
    break;
  case ITEM_META_STATE.SUCCESS:
    ringColor = 'ring-green-500';
    ringSize = 'ring-4';
    titleText = 'Success (added to cart)';
    break;
  case ITEM_META_STATE.FAILED:
    ringColor = 'ring-red-500';
    ringSize = 'ring-4';
    titleText = 'Failed (not added to cart)';
    break;
  }
  return <li>
    <div className="relative pb-8">
      <div className="relative flex space-x-3">
        <div className='flex items-center'>
          <img className={`w-8 rounded-full bg-gray-400
        justify-center ${ringSize} ${ringColor}`} src={thumb} title={titleText}/>
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex flex-col `justify-between space-x-4">
          <div className='flex'>
            <span className='mr-2'>({amt})</span>
            <a href={url} title={name} className="text-sm font-medium underline max-w-md">
              {getDisplayName({ name, scode })}
            </a>
          </div>
          <div><span className='text-xs'>{titleText}</span></div>
        </div>
        <div className='inline-flex items-center p-2'>
          <button
            onClick={() => removeItem({ scode })}
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
      {props.items.map(item => <ToAddItem
        key={item.scode}
        removeItem={props.removeItem}
        {...item}
        cartItem={props.cartState.items.find(itemData => itemData.item.scode === item.scode)}
      ></ToAddItem>)}
    </ul>
  </div>;

}

ToAddList.propTypes = {
  items: PropTypes.array,
  removeItem: PropTypes.fn,
  cartState: PropTypes.shape({
    done: PropTypes.bool,
    items: PropTypes.array(),
  })
};

ToAddItem.propTypes = {
  scode: PropTypes.string,
  url: PropTypes.string,
  thumb: PropTypes.string,
  name: PropTypes.string,
  amt: PropTypes.number,
  removeItem: PropTypes.fn,
  cartItem: PropTypes.shape({
    meta: PropTypes.shape({
      state: PropTypes.string,
    })
  })
};
