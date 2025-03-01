import AddAccountForm from "@/components/domains/account/AddAccountForm";
import Header from "@/components/domains/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getAllUserAccounts, getUser } from "@/actions/users";
import { DollarSign } from "lucide-react";
import TransferBetweenAccountsForm from "@/components/domains/account/TransferBetweenAccountsForm";

export default async function Home() {
    const session = await auth();

    if (!session?.user?.name) {
        return "unauthorized";
    }

    const user = await getUser(session.user.name);
    console.log(session.user.name);
    const accounts = await getAllUserAccounts(session.user.name);

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
                                        {accounts
                                            ?.reduce((psum, a) => psum + Number(a.balance), 0)
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
                            <TransferBetweenAccountsForm />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {accounts?.map((account) => {
                                return (
                                    <Card key={account.accNumber} className="overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">{account.type}</CardTitle>
                                            <CardDescription>
                                                {"*".repeat(account.accNumber.length - 4)}
                                                {account.accNumber.slice(-4, account.accNumber.length)}
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
        </div>
    );
}
