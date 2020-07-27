import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Header from "../components/Header";
import Widget from "../components/Widget";
import Settings from "../components/Settings";
import fetchJson from "../lib/fetchJson";
import { getOrCreateCustomer } from "../lib/ops";
import { reorder, remove, add, unprefixUsername, generateCardId } from "../lib/utils";
import { Direction, OrderItem } from "../lib/typedefs";
import { useRouter } from "next/router";
import { Box, IconButton, Flex } from "theme-ui";
import { GetServerSideProps } from "next";
import { useSession, getSession } from "next-auth/client";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const UserPage = (props) => {
  const {
    query: { v },
  } = useRouter();

  let remoteOrder = null;
  if (props.metadata) {
    if (props.metadata["order"]) {
      try {
        remoteOrder = JSON.parse(props.metadata["order"]);
      } catch (e) {}
    }
  }
  // order of items
  const defaultOrder = [];
  const initialOrder = remoteOrder || defaultOrder;
  const [items, setItems] = useState(initialOrder);

  const [previewing, setPreviewing] = useState(false);
  const [viewingSettings, setViewingSettings] = useState(v === "settings");

  const updateOrder = async function (newOrder: OrderItem[], removedId: string | null = null) {
    try {
      const metadata = {};
      metadata["order"] = JSON.stringify(newOrder);
      if (removedId) {
        metadata[removedId] = null;
      }
      const params = {
        username: props.username,
        metadata: metadata,
        customerId: props.customerId,
      };
      await fetchJson(`/api/update_metadata`, {
        method: "POST",
        body: JSON.stringify(params),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const newItems = reorder(items, result.source.index, result.destination.index);
    setItems(newItems);
    updateOrder(newItems);
  };

  const moveItem = (index: number, direction: Direction) => {
    if (index === 0 && direction === Direction.Up) {
      return;
    }
    const newIndex = direction === Direction.Up ? index - 1 : index + 1;
    const newItems = reorder(items, index, newIndex);
    setItems(newItems);
    updateOrder(newItems);
  };

  const removeItem = (index: number) => {
    const result = remove(items, index);
    setItems(result.items);
    updateOrder(result.items, result.removedId);
  };

  const addItem = () => {
    const newId = generateCardId();
    const newObject = { i: newId };
    const newItems = add(items, newObject);
    setItems(newItems);
    updateOrder(newItems);
  };

  return (
    <Layout>
      <Header username={props.username} />
      <Box py={2} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" isDragDisabled={props.signedIn}>
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.i.toString()} draggableId={item.i.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Widget
                        id={item.i}
                        hideUp={index === 0}
                        hideDown={index === items.length - 1}
                        hideToolbar={previewing}
                        metadata={props.metadata}
                        username={props.username}
                        customerId={props.customerId}
                        signedIn={props.signedIn}
                        onDown={() => {
                          moveItem(index, Direction.Down);
                        }}
                        onUp={() => {
                          moveItem(index, Direction.Up);
                        }}
                        onDelete={() => {
                          removeItem(index);
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {props.signedIn && (
        <Flex sx={{ py: 3, justifyContent: "space-between" }}>
          <Box>
            <IconButton
              sx={{ fontSize: "24px", visibility: items.length > 0 ? "visible" : "hidden" }}
              onClick={() => {
                setPreviewing(!previewing);
              }}
            >
              {previewing ? "✏️" : "👁"}
            </IconButton>
          </Box>
          <Box>
            <IconButton
              sx={{ fontSize: "24px" }}
              onClick={() => {
                setViewingSettings(!viewingSettings);
              }}
            >
              {viewingSettings ? "🔧" : "⚙️"}
            </IconButton>
          </Box>
          <Box>
            <IconButton
              sx={{ fontSize: "24px" }}
              onClick={() => {
                if (!previewing) {
                  addItem();
                }
              }}
            >
              {previewing ? "" : "🆕"}
            </IconButton>
          </Box>
        </Flex>
      )}
      {viewingSettings && props.signedIn && (
        <Settings
          username={props.username}
          metadata={props.metadata}
          customerId={props.customerId}
        />
      )}
      <Box py={4} my={4} />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const query = ctx.query;
  const username = unprefixUsername(query.username as string);
  const session = await getSession(ctx);
  let error = null;
  let customer = null;
  let signedIn = false; // signed in as this user
  let sessionUsername = null;
  // signedIn: check session against url
  if (session && session.user.username) {
    sessionUsername = session.user.username;
    signedIn = sessionUsername === username;
  }
  const response = await getOrCreateCustomer(session, signedIn);
  if (response.errored) {
    return {
      props: {
        username: username,
        error: response.data,
      },
    };
  }
  customer = response.data;
  let metadata = null;
  let customerId = null;
  if (customer) {
    metadata = customer.metadata || null;
    customerId = customer.id || null;
  }
  return {
    props: {
      username: username,
      metadata: metadata,
      customerId: customerId,
      signedIn: signedIn,
      error: error,
    },
  };
};

export default UserPage;
