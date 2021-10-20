import { } from 'react';
import PropTypes from 'prop-types';
import { Switch } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function GenericToggle({
  currentState,
  setCurrentState,
  text,
}) {

  return (
    <Switch.Group as="div" className="flex items-center m-2">
      <Switch
        checked={currentState}
        onChange={setCurrentState}
        className={classNames(
          currentState ? 'bg-indigo-600' : 'bg-gray-200',
          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full',
          'cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none',
          'focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            currentState ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform',
            'ring-0 transition ease-in-out duration-200'
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="text-sm font-medium text-gray-900">{text}</span>
      </Switch.Label>
    </Switch.Group>
  );
}

GenericToggle.propTypes = {
  currentState: PropTypes.bool,
  setCurrentState: PropTypes.func,
  text: PropTypes.string,
};
