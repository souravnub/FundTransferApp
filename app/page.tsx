import AddAccountForm from "@/components/domains/account/AddAccountForm";
import Header from "@/components/domains/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/db";
import { auth } from "@/lib/auth";
import { ArrowLeftRight, Bell, CreditCard, DollarSign, HomeIcon, Menu, PieChart, Settings, User } from "lucide-react";

export default async function Home() {
    const session = await auth();
    const user = await prisma.user.findFirst({ where: { id: session?.user?.id }, include: { accounts: true } });

    if (!user) {
        return <span>No user found</span>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Header />
            <main className="flex-1 p-4 md:p-6">
                <div className="mx-auto max-w-6xl space-y-6">
                    <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <CardHeader>
                            <CardDescription className="text-blue-100">Welcome back</CardDescription>
                            <CardTitle className="text-2xl capitalize ">{user.username}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col">
                                <div className="text-sm text-blue-100">Total Balance</div>
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold">
                                        $
                                        {user.accounts
                                            .reduce((psum, a) => psum + Number(a.balance), 0)
                                            .toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 items-center">
                                <h2 className="text-xl font-semibold">Your Accounts</h2>
                                <AddAccountForm />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline">
                                    Transfer between accounts <ArrowLeftRight />
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {user.accounts.map((account) => {
                                console.log(account);
                                return (
                                    <Card key={account.id} className="overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{account.type}</CardTitle>
                                            <CardDescription>
                                                {"*".repeat(account.accountNumber.length - 4)}
                                                {account.accountNumber.slice(-4, account.accountNumber.length)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-muted-foreground">Available Balance</div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-xl font-semibold">
                                                        {String(account.balance)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
            <nav className="border-t bg-white md:hidden">
                <div className="flex items-center justify-around">
                    <Button variant="ghost" className="flex flex-1 flex-col items-center justify-center gap-1 py-4">
                        <HomeIcon className="h-5 w-5" />
                        <span className="text-xs">Home</span>
                    </Button>
                    <Button variant="ghost" className="flex flex-1 flex-col items-center justify-center gap-1 py-4">
                        <CreditCard className="h-5 w-5" />
                        <span className="text-xs">Accounts</span>
                    </Button>
                    <Button variant="ghost" className="flex flex-1 flex-col items-center justify-center gap-1 py-4">
                        <PieChart className="h-5 w-5" />
                        <span className="text-xs">Insights</span>
                    </Button>
                    <Button variant="ghost" className="flex flex-1 flex-col items-center justify-center gap-1 py-4">
                        <User className="h-5 w-5" />
                        <span className="text-xs">Profile</span>
                    </Button>
                </div>
            </nav>
        </div>
    );
}
