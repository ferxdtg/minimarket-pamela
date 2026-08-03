export default function Hero() {

  return (

    <section

      className="
        relative
        overflow-hidden
        bg-gradient-to-br
        from-red-600
        via-orange-500
        to-yellow-400
        text-white
      "

    >



      <div

        className="
          max-w-7xl
          mx-auto
          px-6
          py-20
          md:py-28
          grid
          md:grid-cols-2
          gap-10
          items-center
        "

      >






        {/* TEXTO */}

        <div>


          <span

            className="
              inline-block
              bg-white/20
              px-4
              py-2
              rounded-full
              text-sm
              font-bold
              mb-5
            "

          >

            🚚 Delivery rápido en tu zona

          </span>






          <h1

            className="
              text-4xl
              md:text-6xl
              font-black
              leading-tight
            "

          >

            Todo lo que necesitas,

            <br/>

            directo a tu puerta.


          </h1>







          <p

            className="
              mt-6
              text-lg
              md:text-xl
              text-white/90
              max-w-lg
            "

          >

            Compra productos del hogar,
            bebidas, snacks y más con
            entrega rápida y pagos fáciles.


          </p>







          <div

            className="
              mt-8
              flex
              flex-wrap
              gap-4
            "

          >



            <button

              className="
                bg-white
                text-red-600
                px-8
                py-4
                rounded-full
                font-black
                text-lg
                hover:scale-105
                transition
                shadow-lg
              "

            >

              Comprar ahora 🛒

            </button>






            <button

              className="
                border-2
                border-white
                px-8
                py-4
                rounded-full
                font-bold
                hover:bg-white
                hover:text-red-600
                transition
              "

            >

              Ver ofertas 🔥

            </button>




          </div>








          {/* BENEFICIOS */}

          <div

            className="
              mt-10
              grid
              grid-cols-3
              gap-4
            "

          >



            <div>

              <p
                className="
                  text-2xl
                  font-black
                "
              >

                🚚

              </p>


              <p
                className="
                  text-sm
                  font-bold
                "
              >

                Delivery

              </p>


            </div>







            <div>

              <p
                className="
                  text-2xl
                  font-black
                "
              >

                📍

              </p>


              <p
                className="
                  text-sm
                  font-bold
                "
              >

                GPS

              </p>


            </div>







            <div>

              <p
                className="
                  text-2xl
                  font-black
                "
              >

                💳

              </p>


              <p
                className="
                  text-sm
                  font-bold
                "
              >

                Pagos

              </p>


            </div>



          </div>






        </div>









        {/* IMAGEN ILUSTRATIVA */}

        <div

          className="
            relative
            flex
            justify-center
          "

        >



          <div

            className="
              bg-white/20
              backdrop-blur
              rounded-3xl
              p-10
              text-center
              shadow-2xl
            "

          >



            <div

              className="
                text-8xl
                md:text-9xl
              "

            >

              🛒

            </div>




            <h2

              className="
                mt-5
                text-2xl
                font-black
              "

            >

              Pamela Market

            </h2>



            <p

              className="
                mt-2
                text-white/80
              "

            >

              Compra fácil y rápido

            </p>



          </div>





        </div>






      </div>





    </section>


  );

}