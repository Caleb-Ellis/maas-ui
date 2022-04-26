import type { HTMLProps, ReactNode } from "react";
import { useState } from "react";

import type {
  InputProps,
  LabelProps,
  SubComponentProps,
} from "@canonical/react-components";
import { Icon, Input, Label } from "@canonical/react-components";
import classNames from "classnames";
import type {
  UseComboboxProps,
  UseComboboxReturnValue,
  UseComboboxStateChange,
} from "downshift";
import { useCombobox } from "downshift";

export type Props = {
  comboboxProps?: SubComponentProps<HTMLProps<HTMLDivElement>>;
  filterFunction?: (
    item: string,
    changes: UseComboboxStateChange<string>
  ) => boolean;
  itemProps?: SubComponentProps<HTMLProps<HTMLLIElement>>;
  items: UseComboboxProps<string>["items"];
  labelProps?: SubComponentProps<Omit<LabelProps, "children" | "required">>;
  menuProps?: SubComponentProps<HTMLProps<HTMLUListElement>>;
  onInputValueChange: UseComboboxProps<string>["onInputValueChange"];
  renderFunction?: (
    item: string,
    useComboboxReturnValue?: UseComboboxReturnValue<string>
  ) => ReactNode;
  toggleProps?: SubComponentProps<HTMLProps<HTMLButtonElement>>;
  useComboboxProps?: Omit<
    UseComboboxProps<string>,
    "items" | "onInputValueChange"
  >;
  wrapperProps?: SubComponentProps<HTMLProps<HTMLDivElement>>;
} & SubComponentProps<InputProps>;

const defaultFilterFunction = (
  item: string,
  changes: UseComboboxStateChange<string>
) => item.toLowerCase().includes((changes.inputValue || "").toLowerCase());

const defaultRenderFunction = (item: string) => item;

export const Combobox = ({
  comboboxProps,
  filterFunction = defaultFilterFunction,
  itemProps,
  items,
  label,
  labelProps,
  menuProps,
  onBlur,
  onChange,
  onFocus,
  onInputValueChange,
  onKeyDown,
  renderFunction = defaultRenderFunction,
  required,
  toggleProps,
  type,
  useComboboxProps,
  value,
  wrapperProps,
  ...inputProps
}: Props): JSX.Element => {
  const [comboboxItems, setComboboxItems] = useState(items);
  const useComboboxReturnValue = useCombobox({
    items: comboboxItems,
    onInputValueChange: (changes) => {
      onInputValueChange && onInputValueChange(changes);
      const filteredItems = items.filter((item) =>
        filterFunction(item, changes)
      );
      setComboboxItems(filteredItems);
    },
    ...useComboboxProps,
  });
  const {
    getComboboxProps,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    getToggleButtonProps,
    highlightedIndex,
    isOpen,
  } = useComboboxReturnValue;

  return (
    <div {...wrapperProps}>
      <Label {...labelProps} {...getLabelProps({ required })}>
        {label}
      </Label>
      <div
        {...getComboboxProps({
          ...comboboxProps,
          className: classNames("combobox", comboboxProps?.className),
        })}
      >
        <Input
          {...inputProps}
          {...getInputProps({
            onBlur,
            onChange,
            onFocus,
            onKeyDown,
            required,
            type: type || "text",
            value,
          })}
        />
        <button
          {...getToggleButtonProps({
            ...toggleProps,
            className: classNames("combobox__toggle", toggleProps?.className),
            type: toggleProps?.type || "button",
          })}
        >
          <Icon name={`chevron-${isOpen ? "up" : "down"}`} />
        </button>
        <ul
          {...getMenuProps({
            ...menuProps,
            className: classNames("combobox__menu", menuProps?.className),
          })}
        >
          {isOpen &&
            comboboxItems.map((item, index) => {
              return (
                <li
                  {...getItemProps({
                    ...itemProps,
                    className: classNames(
                      "combobox__item",
                      { "is-active": highlightedIndex === index },
                      itemProps?.className
                    ),
                    item,
                    index,
                    key: `combobox-item-${index}`,
                  })}
                >
                  {renderFunction(item, useComboboxReturnValue)}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default Combobox;
