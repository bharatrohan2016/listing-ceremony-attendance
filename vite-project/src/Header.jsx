import logo from './assets/bharatrohan-full-logo.png';

const Header = () => {
  return (
	<div className='header'>
		<img src={logo} alt="BharatRohan Logo" style={{ height: '50px' }} />
	</div>
  )
}

export default Header