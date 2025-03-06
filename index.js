const express = require("express");
const http = require("http");
const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const armorManager = require('mineflayer-armor-manager');
const AutoAuth = require('mineflayer-auto-auth');
const app = express();

app.use(express.json());

app.get("/", (_, res) => res.sendFile(__dirname + "/index.html"));
app.listen(process.env.PORT);

setInterval(() 

function createBot() 
  const bot = mineflayer.createBot({
    host: 'GGplayer.aternos.me',
    version: '1.19.4',
    username: 'ServerBot',
    port: 64870,
    plugins: [AutoAuth],
    AutoAuth: 'bot112022'
  });

  bot.loadPlugin(pvp);
  bot.loadPlugin(armorManager);
  bot.loadPlugin(pathfinder);

  let guardPos = null;
  let lastAttackTime = 0;

  function guardArea(pos) {
    guardPos = pos.clone();
    if (!bot.pvp.target) moveToGuardPos();
  }

  function stopGuarding() {
    guardPos = null;
    bot.pvp.stop();
    bot.pathfinder.setGoal(null);
  }

  function moveToGuardPos() {
    if (!guardPos) return;
    const mcData = require('minecraft-data')(bot.version);
    bot.pathfinder.setMovements(new Movements(bot, mcData));
    bot.pathfinder.setGoal(new goals.GoalBlock(guardPos.x, guardPos.y, guardPos.z));
  }

  bot.on('stoppedAttacking', () => {
    if (guardPos) moveToGuardPos();
  });

  bot.on('physicsTick', () => {
    if (!guardPos) return;
    if (Date.now() - lastAttackTime < 5000) return; // تقليل عمليات الهجوم غير الضرورية
    const entity = bot.nearestEntity(e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 16 && e.mobType !== 'Armor Stand');
    if (entity) {
      bot.pvp.attack(entity);
      lastAttackTime = Date.now();
    }
  });

  bot.on('chat', (username, message) => {
    const player = bot.players[username]?.entity;
    if (!player) return;

    if (message === 'guard') {
      bot.chat('سأحرس هنا! 🛡️');
      guardArea(player.position);
    }
    if (message === 'stop') {
      bot.chat('سأتوقف عن الحراسة.');
      stopGuarding();
    }
    if (message === 'تعال') {
      bot.chat(`/tpa ${username}`);
    }
  });

  bot.on('kicked', console.log);
  bot.on('error', console.log);
  bot.on('end', createBot);
}

createBot();
