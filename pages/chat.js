import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React from "react";
import appConfig from "../config.json";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import react from "react";
import { useRouter } from 'next/router';
import {ButtonSendSticker} from '../src/components/ButtonSendStickers';

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQwMDI3MCwiZXhwIjoxOTU4OTc2MjcwfQ.OepXS2xzrE8IfmQChRxenv9rg-reahE8rFF7wUXq07w";
const SUPABASE_URL = "https://guviesarwdjrmnaanjsx.supabase.co";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem){
  return supabaseClient
  .from('mensagens')
  .on('INSERT', (respostaLive) => {
    console.log('Houve uma nova mensagem no banco');
    adicionaMensagem(respostaLive.new)
  })
  .subscribe();
}

export default function ChatPage() {
  const roteamento = useRouter();
  const usuarioLogado = roteamento.query.username;
  const [mensagem, setMensagem] = React.useState("");
  const [listaDeMensagens, setListaDeMensagens] = React.useState([]);

  React.useEffect( () => {
    const dadosDoSupabase = supabaseClient
    .from("mensagens")
    .select("*")
    .order('id', {ascending: false})
    .then(({data}) => {
      //console.log("Dados da consulta: ", data);
      setListaDeMensagens(data);
    });

    escutaMensagensEmTempoReal((novaMensagem)=> {
      setListaDeMensagens((valorAtualDaLista)=>{
        return [
          novaMensagem,
          ...valorAtualDaLista
        ]
      });

    });

  },[]);

  function handleNovaMensagem(novaMensagem) {
    const mensagem = {
      // id: listaDeMensagens.length + 1,
      de: usuarioLogado,
      texto: novaMensagem,
    };

    supabaseClient
    .from('mensagens')
    .insert([
      mensagem
    ])
    .then(({data}) => {
      console.log('Criando mensagem: ', data);
      
    });

    setMensagem('');
  }
  
  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          <MessageList mensagens={listaDeMensagens} />
          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={mensagem}
              onChange={(event) => {
                const valor = event.target.value;
                setMensagem(valor);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleNovaMensagem(mensagem);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handleNovaMensagem(`:sticker: ${sticker}`);
            }}
            
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  const roteamento = useRouter();
  const nomeUsuario = roteamento.query.criador;
  const userLogado = roteamento.query.username;

  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      > 
          <Text variant="heading5">Chat</Text>
          <div>
            <Image 
              styleSheet={{
                width: "59px",
                height: "59px",
                borderRadius: "50%",
                display: "inline-block",
                marginRight: "8px",
              }}
                    //Aqui ?? para receber o usu??rio que vaio da p??gina principal, n??o "brennomachado"
                    src={`https://github.com/${userLogado}.png`}
            />
            <Text variant="heading5"> Ol?? {nomeUsuario}!</Text>
          </div>

        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  // console.log("MessageList", props);
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: "scroll",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {props.mensagens.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: "8px",
              }}
            >
              <Image
                styleSheet={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
                //Aqui ?? para receber o usu??rio que vaio da p??gina principal, n??o "brennomachado"
                src={`https://github.com/${mensagem.de}.png`}
              />
              <Text tag="strong">{mensagem.de}</Text>
              <Text
                styleSheet={{
                  fontSize: "10px",
                  marginLeft: "8px",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {new Date().toLocaleDateString()}
              </Text>
            </Box>


            {mensagem.texto.startsWith(':sticker:')
            ? (
              <Image 
              height='150px'
              width='150px'
              src={mensagem.texto.replace(':sticker:', '')} />
            )
            : (
              mensagem.texto
            )
          }
          </Text>
        );
      })}
    </Box>
  );
}
