import { Center, Spinner } from '@chakra-ui/react';

export const Loader = () =>  {
  return (
    <Center minH="70vh">
      <Spinner size="xl" />
    </Center>
  );
}

