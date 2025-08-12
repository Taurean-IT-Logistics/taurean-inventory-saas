import { IconProps, Icon as IconType } from '@iconscout/react-unicons';

const Unicon = ({ icon: Icon, ...rest }: IconProps & { icon: IconType }) => {
  return <Icon {...rest} />;
};

export default Unicon;
