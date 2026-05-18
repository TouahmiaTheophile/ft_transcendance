'use client';

const Button = ({label}: { label: string }) => {
  return (
    <div>
        <button className ='btn btn-primary' onClick={() => console.log('Click!')}>
          {label}
        </button>
    </div>
  )
}

export default Button  