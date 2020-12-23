import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import PageFooter from '../components/PageFooter';
import { Image, Box, Text, Link, Heading, Flex, Card } from 'theme-ui';
import { GetServerSideProps } from 'next';
import fetchJson from '../lib/fetchJson';
import { Router, useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
const psl = require('psl');

const UserPage = (props) => {
  const router = useRouter();
  let selected = null;

  const { comps } = router.query;
  const type = comps[0];
  const first = comps[1];
  const second = comps[2];
  const third = comps[3];
  const fourth = comps[4];
  let basePath = '/';
  let cards = [];
  let headings = null;
  let title = 'witchcraft.computer';
  if (type === 'o' && first) {
    const firstId = first.replace('_', '');
    basePath = `${type}/${first}`;
    const data = props.map[firstId];
    if (first.endsWith('_')) {
      data['reversed'] = true;
    }
    cards.push(data);
    selected = data;
    title = `${data.name} ✧ witchcraft.computer`;
  } else if (type === 'ppf' && first && second && third) {
    const firstId = first.replace('_', '');
    const secondId = second.replace('_', '');
    const thirdId = third.replace('_', '');
    basePath = `${type}/${first}/${second}/${third}`;
    headings = ['present', 'past', 'future'];
    let data = props.map[firstId];
    if (first.endsWith('_')) {
      data['reversed'] = true;
    }
    cards.push(data);
    data = props.map[secondId];
    if (second.endsWith('_')) {
      data['reversed'] = true;
    }
    cards.push(data);
    data = props.map[thirdId];
    if (third.endsWith('_')) {
      data['reversed'] = true;
    }
    cards.push(data);
    selected = props.map[fourth];
    title = `present, past, future ✧ witchcraft.computer`;
  }

  let description = '';
  if (cards.length > 1) {
    cards.forEach((c) => {
      if (description.length > 0) {
        description = description + ' ✧ ';
      }
      description = description + c.name;
    });
  } else {
    description = cards[0].desc;
  }
  const url = `https://witchcraft.computer`;
  const twitter = '@tarotComputer';
  let previewImage = `http://witchcraft.computer/rider-waite/${cards[0].id}.png`;
  if (selected) {
    previewImage = `http://witchcraft.computer/rider-waite/${selected.id}.png`;
  }

  return (
    <Layout>
      <Box sx={{ flexDirection: 'column', justifyContent: 'center', my: 4 }}>
        <NextSeo
          title={title}
          description={description}
          openGraph={{
            url: url,
            title: title,
            description: description,
            images: [
              {
                url: previewImage,
                alt: title,
              },
            ],
            site_name: 'witchcraft.computer',
          }}
          twitter={{
            handle: twitter,
            site: twitter,
            cardType: 'summary_large_image',
          }}
        />
        <Flex sx={{ justifyContent: 'center', mx: 2 }}>
          <Flex sx={{ flexDirection: 'row', justifyContent: 'center' }}>
            {cards.map((card, i) => {
              const prefix = card.id.split('-')[0];
              return (
                <Flex key={card.id} sx={{ mx: 1, mt: 3, width: 300, flexDirection: 'column', alignItems: 'center' }}>
                  {headings && (
                    <Text
                      sx={{
                        fontFamily: 'mono',
                        fontWeight: 'bold',
                        mb: 2,
                      }}
                    >
                      {headings[i]}
                    </Text>
                  )}
                  <Card
                    variant={`card_${prefix}`}
                    sx={{}}
                    onClick={() => {
                      if (type !== 'o') {
                        router.push(`${basePath}/${card.id}`);
                      }
                    }}
                  >
                    <Image
                      src={`${props.baseUrl}/rider-waite/${card.id}.svg`}
                      sx={{ transform: card.reversed ? 'rotate(180deg);' : 'none' }}
                    />
                  </Card>
                  <Text
                    sx={{
                      fontSize: 18,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      fontFamily: 'mono',
                      fontWeight: 'bold',
                      pt: 2,
                    }}
                  >
                    {card.name}
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        </Flex>
        <PageFooter />
        {selected && (
          <Box sx={{ fontFamily: 'mono', pb: 4 }}>
            <Link href={type === 'o' ? selected.wiki : `/o/${selected.id}`} target={type === 'o' ? '_blank' : 'none'}>
              <Heading sx={{ fontFamily: 'mono' }}>{selected.name}</Heading>
            </Link>
            <Text sx={{ py: 2 }}>{selected.desc}</Text>
            {selected.desc_rev && (
              <Text>
                <strong>Reversed: </strong> {selected.desc_rev}
              </Text>
            )}
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let baseUrl = 'http://witchcraft.computer';
  if (process.env.NODE_ENV === 'development') {
    baseUrl = 'http://127.0.0.1:3000';
  }
  const list = await fetchJson(`${baseUrl}/data.json`);
  const map = {};
  list.forEach((c) => {
    map[c.id] = c;
  });
  return {
    props: { baseUrl: baseUrl, list: list, map: map },
  };
};
export default UserPage;
