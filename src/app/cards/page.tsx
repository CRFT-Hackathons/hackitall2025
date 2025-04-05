// export default function Component() {
//   return <div></div>;
// }
import type { Metadata } from "next";
import Image from "next/image";

import { cn } from "~/lib/utils";

import { DemoCookieSettings } from "./components/cookie-settings";
import { DemoCreateAccount } from "./components/create-account";
import { DemoDatePicker } from "./components/date-picker";
import { DemoGithub } from "./components/github-card";
import { DemoNotifications } from "./components/notifications";
import { DemoPaymentMethod } from "./components/payment-method";
import { DemoReportAnIssue } from "./components/report-an-issue";
import { DemoShareDocument } from "./components/share-document";
import { DemoTeamMembers } from "./components/team-members";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";

export const metadata = {
  title: "Cards",
  description: "Examples of cards built using the components.",
} satisfies Metadata;

function DemoContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-center [&>div]:w-full",
        className
      )}
      {...props}
    />
  );
}

export default function CardsPage() {
  return (
    <div className="hidden items-start justify-center gap-6 rounded-lg p-8 md:grid lg:grid-cols-2 xl:grid-cols-3">
      <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
        <DemoContainer>
          <DemoCreateAccount />
        </DemoContainer>
        <DemoContainer>
          {/* <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>
                Enter your email below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-6">
                <Button variant="outline">
                  <div className="mr-2 size-4 bg-blue-400" />
                  Github
                </Button>
                <Button variant="outline">
                  <div className="mr-2 size-4 bg-blue-400" />
                  Google
                </Button>
              </div>

              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>
                    Enter your email below to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-6">
                    <Button variant="outline">
                      <div className="mr-2 size-4 bg-blue-400" />
                      Github
                    </Button>
                    <Button variant="outline">
                      <div className="mr-2 size-4 bg-blue-400" />
                      Google
                    </Button>
                  </div>

                  <Card>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-2xl">
                        Create an account
                      </CardTitle>
                      <CardDescription>
                        Enter your email below to create your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-2 gap-6">
                        <Button variant="outline">
                          <div className="mr-2 size-4 bg-blue-400" />
                          Github
                        </Button>
                        <Button variant="outline">
                          <div className="mr-2 size-4 bg-blue-400" />
                          Google
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </CardContent>
          </Card> */}
          <DemoPaymentMethod />
        </DemoContainer>
      </div>
      <div className="col-span-2 grid items-start gap-6 lg:col-span-1">
        <DemoContainer>
          <DemoTeamMembers />
        </DemoContainer>
        <DemoContainer>
          <DemoShareDocument />
        </DemoContainer>
        <DemoContainer>
          <DemoDatePicker />
        </DemoContainer>
        <DemoContainer>
          <DemoNotifications />
        </DemoContainer>
      </div>
      <div className="col-span-2 grid items-start gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
        <DemoContainer>
          <DemoReportAnIssue />
        </DemoContainer>
        <DemoContainer>
          <DemoGithub />
        </DemoContainer>
        <DemoContainer>
          <DemoCookieSettings />
        </DemoContainer>
      </div>
    </div>
  );
}
