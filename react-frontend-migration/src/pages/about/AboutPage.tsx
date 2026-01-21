import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { Button, Card, ContactForm, Footer } from '@/components/ui';

function AboutPage(): ReactElement {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 px-3 xl:px-4 py-3">
        <h1 className="text-[16px] md:text-[18px] font-semibold text-gray-800">
          About Page
        </h1>
      </header>

      <main className="flex-1">
        <div className="about-container px-3 lg:px-5 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1">
            <div className="col-span-1">
              <Card className="shadow-none mt-4 p-4 mb-16">
                <Card.Header className="border-b-0 px-0 py-0">
                  <h2 className="text-[24px] lg:text-[28px] xl:text-[34px] font-bold text-gray-800">
                    Application
                  </h2>
                </Card.Header>
                <div className="h-[6px] w-[250px] rounded bg-blue-500 my-3" />
                <Card.Body className="px-0">
                  <p className="md:text-[16px] font-light text-gray-700">
                    A online property management solution for real estate and
                    physical property management. This can include residential,
                    commercial, and land real estate. a software developed to
                    connect property managers and potential buyers.
                  </p>
                  <p className="pt-4 md:text-[16px] font-light text-gray-700">
                    Whether you operate 1 to 100 properties this app will help you
                    advertise, manage and sell your properties to potential
                    buyers.
                  </p>
                </Card.Body>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex justify-center items-center">
              <img
                src="/images/about/about-map.svg"
                alt="map image"
                className="max-w-full h-auto"
              />
            </div>
            <div>
              <Card className="shadow-none p-4 mb-32">
                <Card.Header className="border-b-0 px-0 py-0">
                  <h2 className="text-[24px] lg:text-[28px] xl:text-[34px] font-bold text-gray-800">
                    MAP VIEW
                  </h2>
                </Card.Header>
                <div className="h-[6px] w-[250px] rounded bg-blue-500 my-3" />
                <Card.Body className="px-0 pb-4">
                  <p className="md:text-[16px] font-light text-gray-700">
                    Maps can be a useful tool for viewing properties location &
                    filter them by types. this also help us to know distances so
                    that we know how far away one thing is from another.
                  </p>
                  <p className="pt-4 md:text-[16px] font-light text-gray-700">
                    You might not necessarily want to find the fastest route from
                    property A to property B, you might want to take the scenic
                    route. Knowing how to spot mountains, lakes, coastline and
                    historic sites on a map helps you to plan which property to
                    visit.
                  </p>
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>

        <div
          className="flex justify-center py-[100px] mt-[52px]"
          style={{
            backgroundImage: 'url(/images/about/about-bg-contact.svg)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          <Link to="/user/register">
            <Button variant="success" size="lg">
              TRY US NOW
            </Button>
          </Link>
        </div>

        <div className="about-container px-3 lg:px-5 pt-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1">
            <div className="col-span-1">
              <Card className="shadow-none p-4 mb-24">
                <Card.Header className="border-b-0 px-0 py-0">
                  <h2 className="text-[24px] lg:text-[28px] xl:text-[34px] font-bold text-gray-800">
                    PROPERTIES
                  </h2>
                </Card.Header>
                <div className="h-[6px] w-[250px] rounded bg-blue-500 my-3" />
                <Card.Body className="px-0 pb-4">
                  <div className="text-[16px] lg:text-[18px] font-light text-gray-700">
                    <strong className="text-[18px]">
                      Do you spend way too much time looking for a Real Estate
                      Property to buy?
                    </strong>
                    <p className="md:text-[16px] mt-2">
                      dont worry we have you covered, We have hundreds of high
                      quality properties ready to sell. you can use the search
                      field to find properties and to see basic information(price,
                      address, types, etc...) about the desired property.
                    </p>
                  </div>
                  <div className="pt-4 text-gray-700">
                    <strong className="text-[18px]">
                      Do you own a property you wanted to sell?
                    </strong>
                    <p className="md:text-[16px] mt-2">
                      Our application will help advertise your property to
                      potential buyers.
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <div className="p-1">
              <Card className="shadow-none border border-gray-200">
                <Card.Header className="border-b-0">
                  <h3 className="px-3 md:px-4 py-3 text-[18px]">
                    <span className="text-blue-500 font-bold text-[32px]">Connect</span>{' '}
                    with people
                  </h3>
                </Card.Header>
                <Card.Body className="flex justify-center h-[300px]">
                  <img
                    src="/images/about/about-connection.svg"
                    alt="Connect with people"
                    className="max-h-full"
                  />
                </Card.Body>
              </Card>
            </div>
            <div className="p-1">
              <Card className="shadow-none border border-gray-200">
                <Card.Header className="border-b-0">
                  <h3 className="px-3 md:px-4 py-3 text-[18px]">
                    <span className="text-blue-500 font-bold text-[32px]">Buy</span>{' '}
                    new properties
                  </h3>
                </Card.Header>
                <Card.Body className="flex justify-center h-[300px]">
                  <img
                    src="/images/about/about-buy.svg"
                    alt="Buy new properties"
                    className="max-h-full"
                  />
                </Card.Body>
              </Card>
            </div>
            <div className="p-1">
              <Card className="shadow-none border border-gray-200">
                <Card.Header className="border-b-0">
                  <h3 className="px-3 md:px-4 py-3 text-[18px]">
                    <span className="text-blue-500 font-bold text-[32px]">Sell</span>{' '}
                    your properties
                  </h3>
                </Card.Header>
                <Card.Body className="flex justify-center h-[300px]">
                  <img
                    src="/images/about/about-sell.svg"
                    alt="Sell your properties"
                    className="max-h-full"
                  />
                </Card.Body>
              </Card>
            </div>
          </div>

          <div className="h-[100px]" />
        </div>

        <div
          className="py-4"
          style={{
            backgroundImage: 'url(/images/about/about-bg-contact.svg)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left',
          }}
        >
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 py-3 lg:py-5">
              <div className="lg:col-span-5 xl:col-span-6 flex flex-col items-center justify-center">
                <div className="text-[32px] text-white font-bold">
                  Let&apos;s get in touch
                </div>
                <div className="text-2xl text-gray-300 tracking-wide">
                  Have an inquiry or some feedback for us?
                </div>
              </div>
              <div className="lg:col-span-7 xl:col-span-6 px-3 lg:px-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default AboutPage;
