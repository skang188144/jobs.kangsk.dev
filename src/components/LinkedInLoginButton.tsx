import { Button, ButtonProps } from '@mantine/core';
import { FaLinkedin } from 'react-icons/fa';

export const LinkedInLoginButton = (props: ButtonProps & React.ComponentPropsWithoutRef<'button'>) => {
  return (
    <Button leftSection={<FaLinkedin size={16} color="#0A66C2" />} variant="default" {...props} />
  );
}