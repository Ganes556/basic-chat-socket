import { FormEvent } from 'react';

type ActionMessage = {
  varian?: 'message';
  onLeave?: () => void;
};
type ActionRoom = {
  varian: 'room';
  onLeave: () => void;
};
type ActionProps = {
  label: string;
  btnName: string;
  nameInput: string;

  onAction: (e: FormEvent<HTMLFormElement>) => void;
} & (ActionMessage | ActionRoom);

function Action({
  varian,
  label,
  btnName,
  nameInput,
  onAction,
  onLeave,
}: ActionProps) {
  return (
    <form onSubmit={onAction} method='POST'>
      <div className='flex justify-evenly gap-5'>
        <label htmlFor={label} className='w-14'>
          {label}
        </label>
        <input id={label} name={nameInput} placeholder={label} className='flex-grow' type='text' />
        {(!varian || varian === 'message') && <input placeholder='send to' name={'to'} className='flex-grow' type='text' />}
        <button
          type='submit'
          className='w-14 ring-1 px-2 bg-slate-300 text-slate-800'
        >
          {btnName}
        </button>
        {varian === 'room' && (
          <button
            type='button'
            className='ring-1 px-2 bg-slate-300 text-slate-800'
            onClick={onLeave}
          >
            Leave
          </button>
        )}
      </div>
    </form>
  );
}

export default Action;
