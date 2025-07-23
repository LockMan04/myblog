
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const Dropdown = ({ trigger, children, align = 'end', sideOffset = 5, onOpenChange, className = '' }) => {
  return (
    <DropdownMenu.Root onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`dropdown-portal ${className}`}
          align={align}
          sideOffset={sideOffset}
          modal= "true"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const DropdownItem = ({ children, onSelect, className = '', ...props }) => (
  <DropdownMenu.Item
    className={`dropdown-item ${className}`}
    onSelect={onSelect}
    {...props}
  >
    {children}
  </DropdownMenu.Item>
);

const DropdownSeparator = ({ className = '' }) => (
  <DropdownMenu.Separator className={`dropdown-separator ${className}`} />
);

export { Dropdown, DropdownItem, DropdownSeparator };
