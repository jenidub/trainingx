"use client";

import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useToast } from "@/hooks/use-toast";
import { Bot, Plus, Trash2, Edit, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Id } from "convex/_generated/dataModel";

const insertCustomGPTSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  instructions: z.string().min(1, "Instructions are required").max(5000),
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function CustomGPTsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGPT, setEditingGPT] = useState<{ _id: string; name: string; systemPrompt: string } | null>(null);
  const [chatGPT, setChatGPT] = useState<{ _id: string; name: string; systemPrompt: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?._id as Id<"users"> | undefined;

  const form = useForm({
    resolver: zodResolver(insertCustomGPTSchema),
    defaultValues: {
      name: "",
      instructions: "",
    },
  });

  const customGPTs = useQuery(
    api.customGPTs.getCustomGPTs,
    userId ? { userId } : "skip"
  );

  const createMutation = useMutation(api.customGPTs.createCustomGPT);
  const deleteMutation = useMutation(api.customGPTs.deleteCustomGPT);
  const updateMutation = useMutation(api.customGPTs.updateCustomGPT);
  const chatAction = useAction(api.customGPTs.chatWithCustomGPT);

  const handleCreate = async (data: z.infer<typeof insertCustomGPTSchema>) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to create a custom GPT",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation({
        name: data.name,
        description: data.instructions,
        systemPrompt: data.instructions,
        creatorId: userId,
        isPublic: false,
        category: "custom",
        tags: [],
      });
      toast({ title: "Success", description: "Custom GPT created!" });
      setIsCreateOpen(false);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create GPT", variant: "destructive" });
    }
  };

  const handleUpdate = async (gptId: Id<"customAssistants">, data: z.infer<typeof insertCustomGPTSchema>) => {
    try {
      await updateMutation({
        gptId,
        name: data.name,
        description: data.instructions,
        systemPrompt: data.instructions,
      });
      toast({ title: "Success", description: "Custom GPT updated!" });
      setEditingGPT(null);
      form.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update GPT", variant: "destructive" });
    }
  };

  const handleDelete = async (gptId: Id<"customAssistants">) => {
    try {
      await deleteMutation({ gptId });
      toast({ title: "Success", description: "Custom GPT deleted!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete GPT", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (editingGPT) {
      form.reset({
        name: editingGPT.name,
        instructions: editingGPT.systemPrompt,
      });
    }
  }, [editingGPT, form]);

  const handleSubmit = (data: z.infer<typeof insertCustomGPTSchema>) => {
    if (editingGPT) {
      handleUpdate(editingGPT._id as Id<"customAssistants">, data);
    } else {
      handleCreate(data);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatGPT || chatAction.isPending) return;

    const userMessage: ChatMessage = { role: "user", content: chatInput };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput("");

    try {
      const result = await chatAction({
        gptId: chatGPT._id as Id<"customAssistants">,
        messages: newMessages,
      });
      setChatMessages((prev) => [...prev, { role: "assistant", content: result.message }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarLayout>
      <div className="h-full overflow-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gradient-from to-gradient-to flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight">Custom Agent Builder</h1>
                <p className="text-muted-foreground">
                  Create and manage your own AI assistants with custom instructions
                </p>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-gradient-from to-gradient-to">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Agent
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom GPT</DialogTitle>
                    <DialogDescription>
                      Create a custom AI assistant with specific instructions
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Marketing Assistant"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="You are a helpful marketing assistant that specializes in social media content..."
                                rows={6}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending ? "Creating..." : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {customGPTs === undefined ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : customGPTs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No custom GPTs yet</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First GPT
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customGPTs.map((gpt) => (
                <Card key={gpt._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      {gpt.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {gpt.description || gpt.systemPrompt}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setChatGPT(gpt);
                        setChatMessages([]);
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingGPT(gpt)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(gpt._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={!!editingGPT} onOpenChange={(open) => !open && setEditingGPT(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Custom GPT</DialogTitle>
                <DialogDescription>
                  Update your custom AI assistant's instructions
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Marketing Assistant"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="You are a helpful marketing assistant..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? "Updating..." : "Update"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={!!chatGPT} onOpenChange={(open) => !open && setChatGPT(null)}>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {chatGPT?.name}
                </DialogTitle>
                <DialogDescription>{chatGPT?.systemPrompt || chatGPT?.description}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatAction.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2 pt-4 border-t">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || chatAction.isPending}
                >
                  Send
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SidebarLayout>
  );
}

