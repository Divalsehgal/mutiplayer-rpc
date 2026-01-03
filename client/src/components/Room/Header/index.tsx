import { CopyIcon } from "@chakra-ui/icons";
import { Button, Heading, HStack, Text } from "@chakra-ui/react";

export const RoomHeader = ({ roomId }: { roomId: string }) => {
  return (
    <HStack justify="space-between">
      <Heading as="h3" size="md">
        <Button
          size="sm"
          variant="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(roomId);
            } catch (e) {
              // ignore
            }
          }}
        >
          <HStack gap={2}>
            <CopyIcon />
            <Text>{roomId}</Text>
          </HStack>
        </Button>
      </Heading>
    </HStack>
  );
};
