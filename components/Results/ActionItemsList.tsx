"use client";


import { removeAsterisks } from './downloadUtils';

interface ActionItemsListProps {
  items: string[];
}

const ActionItemsList = ({ items }: ActionItemsListProps) => {
  const formatActionItem = (item: string) => {
    return removeAsterisks(item);
  };

  return (
    <ul className="space-y-3 max-h-96 overflow-y-auto">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <div className="flex-shrink-0 h-5 w-5 rounded-full bg-steno-blue text-white flex items-center justify-center text-xs mr-3 mt-0.5">
            {index + 1}
          </div>
          <span className="text-gray-700">
            {formatActionItem(item)}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ActionItemsList;
