import PropTypes from 'prop-types';


export default function OverwriteCartToggle({
  noItems,
  activeTab,
}) {

  const classes = [
    "inline-flex", "items-center", "px-3", "py-2", "border", "border-transparent", "text-sm", "leading-4", "font-medium", "rounded-md", "shadow-sm", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "focus:outline-none", "focus:ring-2", "focus:ring-offset-2", "focus:ring-indigo-500"
  ]

  if(noItems || !activeTab) {
    classes.push('opacity-50', 'cursor-not-allowed');
  }

  return <div className='mt-4 flex'>
    <button
      disabled={noItems}
      type="button"
      className={classes.join(' ')}
    >
      Add to Amiami Cart
    </button>
  </div>;

}



OverwriteCartToggle.propTypes = {
  noItems: PropTypes.bool,
  activeTab: PropTypes.bool,
};
