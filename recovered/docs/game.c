////////////////////////////////////////////////////////////////////////////
// extremely simple single player game
////////////////////////////////////////////////////////////////////////////
#include <acknex.h>
#include <default.c>

STRING* soldier_desc = "A soldier";

STRING* char_desc = "That's you, silly,";

STRING* soldier_diag = "Me?  I don't know anything about magic beards.";

BMAP* cursor_pcx = "cursor.pcx";

TEXT* soldier_display_txt =
{
    pos_x = 600;
    pos_y = 400;
    string (soldier_desc);
    layer = 1;
    flags = CENTER_X | TRANSLUCENT;
}

TEXT* char_display_txt =
{
    pos_x = 600;
    pos_y = 400;
    string (char_desc);
    layer = 1;
    flags = CENTER_X | TRANSLUCENT;
}

TEXT* soldier_chat_txt =
{
    pos_x = 200;
    pos_y = 200;
    string (soldier_diag);
    layer = 1;
    flags = CENTER_X | TRANSLUCENT;
}


function soldier_text_event(){
	if (event_type == EVENT_TOUCH)
       {
               soldier_display_txt.flags |= SHOW;
       }
       else if (event_type == EVENT_RELEASE)
       {
              soldier_display_txt.flags = 0;
  
      }
      else if (event_type == EVENT_CLICK)
       {
       		  soldier_chat_txt.flags |= SHOW;
       		  wait(-3);
              soldier_chat_txt.flags = 0;
  
      }
}

function char_text_event(){
	if (event_type == EVENT_TOUCH)
       {
               char_display_txt.flags |= SHOW;
       }
       else if (event_type == EVENT_RELEASE)
       {
              char_display_txt.flags = 0;
       }
}
 
action player_move() // control the player on the client, move it on the server
{  
    my.emask = ENABLE_TOUCH | ENABLE_RELEASE;
// run function highlight_event the wizards are touched or released
  my.event = char_text_event;   
  var walk_percentage = 0;
  while (1) 
  {
    my.pan += (key_a - key_d)*5*time_step;   // rotate the entity using [A],[D]
    var distance = (key_w - key_s)*5*time_step;
    c_move(me, vector(distance,0,0), NULL, GLIDE); // move it using [W],[S]
    walk_percentage += distance;
    ent_animate(me,"walk",walk_percentage,ANM_CYCLE); // animate the entity
    wait (1);
  }
}

action soldier_text()
{
	// make the wizard models sensitive to mouse touching and releasing
  my.emask = ENABLE_TOUCH | ENABLE_RELEASE | ENABLE_CLICK;
// run function highlight_event the wizards are touched or released
  my.event = soldier_text_event; 
}

function main() 
{
  level_load ("multiplayer6.wmb");
  mouse_mode = 2;
   mouse_map = cursor_pcx;
  vec_set(camera.x, vector (-600, 0, 100)); // set a proper camera position
  ent_create ("redguard.mdl", vector (100, 50, 40), player_move); // then create the red guard!
  ent_create ("blueguard.mdl", vector (100, 300, 40), soldier_text);
  while (1)
  {
      mouse_pos.x = mouse_cursor.x; // allow the mouse pointer to move
      mouse_pos.y = mouse_cursor.y; // on the x and y axis
      wait (1);
  }
}